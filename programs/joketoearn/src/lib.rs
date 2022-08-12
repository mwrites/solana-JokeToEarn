use anchor_lang::prelude::*;

declare_id!("HZy4kyk53Zsrzgv84fuRmuXFNar9VAyJmqwVZtK1iEVy");

#[program]
pub mod joketoearn {
    use super::*;

    //region V2
    pub fn create_joke_v2(ctx: Context<CreateJokeCtxV2>, joke_content: String) -> Result<()> {
        let joke: &mut Account<JokeV2> = &mut ctx.accounts.joke_account;
        joke.author = *ctx.accounts.payer.key;
        joke.created_at = Clock::get().unwrap().unix_timestamp;

        if joke_content.chars().count() > JokeV2::LENGTH_CONTENT {
            return Err(error!(JokeToEarnError::JokeContentMaxCharacters));
        }
        joke.content = joke_content;

        Ok(())
    }
    //endregion

    //region V3
    pub fn create_joke_v3(ctx: Context<CreateJokeCtxV3>, joke_content: String) -> Result<()> {
        let joke: &mut Account<JokeV3> = &mut ctx.accounts.joke_pda;
        joke.author = *ctx.accounts.payer.key;
        joke.created_at = Clock::get().unwrap().unix_timestamp;
        joke.votes = 0;

        if joke_content.chars().count() > JokeV3::LENGTH_CONTENT {
            return Err(error!(JokeToEarnError::JokeContentMaxCharacters));
        }
        joke.content = joke_content;

        Ok(())
    }
    //endregion
}


//region V2
#[derive(Accounts)]
pub struct CreateJokeCtxV2<'info> {
    #[account(init, payer = payer, space = JokeV2::SPACE)]
    pub joke_account: Account<'info, JokeV2>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}


#[account]
pub struct JokeV2 {
    pub author: Pubkey,
    pub created_at: i64,
    pub content: String,
}

impl JokeV2 {
    const SPACE_DISCRIMINATOR: usize = 8;
    const SPACE_AUTHOR: usize = 32;
    const SPACE_CREATED_AT: usize = 8;
    // Max of 80 characters but a borsh string is [len+vec] https://borsh.io/
    const LENGTH_CONTENT: usize = 80;
    const SPACE_CONTENT: usize = 84;

    const SPACE: usize = JokeV2::SPACE_DISCRIMINATOR
        + JokeV2::SPACE_AUTHOR
        + JokeV2::SPACE_CREATED_AT
        + JokeV2::SPACE_CONTENT;
}
//endregion


//region V3
#[derive(Accounts)]
pub struct CreateJokeCtxV3<'info> {
    /// CHECK: just used as a uuid
    pub joke_id: AccountInfo<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
    init,
    payer = payer,
    space = JokeV3::SPACE,
    seeds = [b"joke", payer.key().as_ref(), joke_id.key().as_ref()],
    bump // canonical bump
    )]
    pub joke_pda: Account<'info, JokeV3>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct JokeV3 {
    pub author: Pubkey,
    pub created_at: i64,
    pub votes: u32,
    pub content: String,
}


impl JokeV3 {
    const SPACE_DISCRIMINATOR: usize = 8;
    const SPACE_AUTHOR: usize = 32;
    const SPACE_CREATED_AT: usize = 8;
    const SPACE_VOTES: usize = 4;
    // Max of 80 characters but a borsh string is [len+vec] https://borsh.io/
    const LENGTH_CONTENT: usize = 80;
    const SPACE_CONTENT: usize = 84;

    const SPACE: usize = JokeV3::SPACE_DISCRIMINATOR
        + JokeV3::SPACE_AUTHOR
        + JokeV3::SPACE_CREATED_AT
        + JokeV3::SPACE_VOTES
        + JokeV3::SPACE_CONTENT;
}


#[error_code]
pub enum JokeToEarnError {
    #[msg("The joke content should be 80 characters max, after that it's not funny")]
    JokeContentMaxCharacters,
}
//endregion
