use anchor_lang::prelude::*;

declare_id!("HZy4kyk53Zsrzgv84fuRmuXFNar9VAyJmqwVZtK1iEVy");

#[program]
pub mod joketoearn {
    use super::*;

    //region v1
    pub fn create_joke_v1(ctx: Context<CreateJokeCtxV1>, joke_content: String) -> Result<()> {
        let joke: &mut Account<JokeV1> = &mut ctx.accounts.joke_account;
        joke.author = *ctx.accounts.author.key;
        joke.created_at = Clock::get().unwrap().unix_timestamp;
        joke.votes = 0;

        if joke_content.chars().count() > JokeV1::LENGTH_CONTENT {
            return Err(error!(JokeToEarnError::JokeContentMaxCharacters));
        }
        joke.content = joke_content;

        Ok(())
    }

    pub fn upvote_joke_v1(ctx: Context<UpVoteJokeCtxV1>) -> Result<()> {
        let joke: &mut Account<JokeV1> = &mut ctx.accounts.joke_account;
        let address = joke.key();

        msg!(format!("address: {}", address.to_string()).as_ref());
        msg!(format!("votes before: {}", joke.votes.to_string()).as_ref());
        joke.votes += 1;
        joke.content = "caca lol".parse().unwrap();
        msg!(format!("votes after: {}", joke.votes.to_string()).as_ref());



        Ok(())
    }
    //endregion

    //region v2
    pub fn create_joke_v2(ctx: Context<CreateJokeCtxV2>, joke_content: String) -> Result<()> {
        let joke: &mut Account<JokeV2> = &mut ctx.accounts.joke_pda;
        joke.author = *ctx.accounts.author.key;
        joke.created_at = Clock::get().unwrap().unix_timestamp;
        joke.votes = 0;

        if joke_content.chars().count() > JokeV2::LENGTH_CONTENT {
            return Err(error!(JokeToEarnError::JokeContentMaxCharacters));
        }
        joke.content = joke_content;

        Ok(())
    }

    pub fn upvote_joke_v2(ctx: Context<UpVoteJokeCtxV2>) -> Result<()> {
        let joke: &mut Account<JokeV2> = &mut ctx.accounts.joke_pda;
        let address = joke.key();

        msg!(format!("pda: {}", address.to_string()).as_ref());
        msg!(format!("votes before: {}", joke.votes.to_string()).as_ref());
        joke.votes += 1;
        msg!(format!("votes after: {}", joke.votes.to_string()).as_ref());

        Ok(())
    }
    //endregion
}


//region v1
#[derive(Accounts)]
pub struct CreateJokeCtxV1<'info> {
    #[account(init, payer = author, space = JokeV1::SPACE)]
    pub joke_account: Account<'info, JokeV1>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpVoteJokeCtxV1<'info> {
    #[account(mut)]
    pub joke_account: Account<'info, JokeV1>,

    #[account(mut)]
    pub voter: Signer<'info>,
}


#[account]
pub struct JokeV1 {
    pub author: Pubkey,
    pub created_at: i64,
    pub votes: u32,
    pub content: String,
}

impl JokeV1 {
    const SPACE_DISCRIMINATOR: usize = 8;
    const SPACE_AUTHOR: usize = 32;
    const SPACE_CREATED_AT: usize = 8;
    const SPACE_VOTES: usize = 4;
    // Max of 80 characters but a borsh string is [len+vec] https://borsh.io/
    const LENGTH_CONTENT: usize = 80;
    const SPACE_CONTENT: usize = 84;

    const SPACE: usize = JokeV1::SPACE_DISCRIMINATOR
        + JokeV1::SPACE_AUTHOR
        + JokeV1::SPACE_CREATED_AT
        + JokeV1::SPACE_VOTES
        + JokeV1::SPACE_CONTENT;
}

//endregion


//region v2
#[derive(Accounts)]
pub struct CreateJokeCtxV2<'info> {
    /// CHECK: just used as a uuid
    pub joke_id: AccountInfo<'info>,

    #[account(
    init,
    payer = author,
    space = JokeV2::SPACE,
    seeds = [b"joke", author.key().as_ref(), joke_id.key().as_ref()],
    bump // canonical bump
    )]
    pub joke_pda: Account<'info, JokeV2>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpVoteJokeCtxV2<'info> {
    #[account(mut)]
    pub joke_pda: Account<'info, JokeV2>,

    #[account(mut)]
    pub voter: Signer<'info>,
}

#[account]
pub struct JokeV2 {
    pub author: Pubkey,
    pub created_at: i64,
    pub votes: u32,
    // pub id: Pubkey,
    // pub bump: u8,
    pub content: String,
}


impl JokeV2 {
    const SPACE_DISCRIMINATOR: usize = 8;
    const SPACE_AUTHOR: usize = 32;
    const SPACE_CREATED_AT: usize = 8;
    const SPACE_VOTES: usize = 4;
    // Max of 80 characters but a borsh string is [len+vec] https://borsh.io/
    const LENGTH_CONTENT: usize = 80;
    const SPACE_CONTENT: usize = 84;

    const SPACE: usize = JokeV2::SPACE_DISCRIMINATOR
        + JokeV2::SPACE_AUTHOR
        + JokeV2::SPACE_CREATED_AT
        + JokeV2::SPACE_VOTES
        + JokeV2::SPACE_CONTENT;
}


#[error_code]
pub enum JokeToEarnError {
    #[msg("The joke content should be 80 characters max, after that it's not funny")]
    JokeContentMaxCharacters,
}
//endregion
