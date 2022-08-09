use anchor_lang::prelude::*;

declare_id!("HZy4kyk53Zsrzgv84fuRmuXFNar9VAyJmqwVZtK1iEVy");

#[program]
pub mod joketoearn {
    use super::*;

    pub fn create_joke(ctx: Context<CreateJokeCtx>, joke_content: String) -> Result<()> {
        let joke: &mut Account<Joke> = &mut ctx.accounts.joke_account;
        joke.author = *ctx.accounts.authority.key;
        joke.created_at = Clock::get().unwrap().unix_timestamp;

        if joke_content.chars().count() > Joke::LENGTH_CONTENT {
            return Err(error!(JokeToEarnError::JokeContentMaxCharacters));
        }
        joke.content = joke_content;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateJokeCtx<'info> {
    // properly set the space later
    #[account(init, payer = authority, space = Joke::SPACE)]
    pub joke_account: Account<'info, Joke>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}


#[account]
pub struct Joke {
    pub author: Pubkey,
    pub created_at: i64,
    pub content: String,
}


impl Joke {
    const SPACE_DISCRIMINATOR: usize = 8;
    const SPACE_AUTHOR: usize = 32;
    const SPACE_CREATED_AT: usize = 8;
    const SPACE_VOTES: usize = 4;
    // Max of 80 characters but a borsh string is [len+vec] https://borsh.io/
    const LENGTH_CONTENT: usize = 80;
    const SPACE_CONTENT: usize = 84;

    const SPACE: usize = Joke::SPACE_DISCRIMINATOR
        + Joke::SPACE_AUTHOR
        + Joke::SPACE_CREATED_AT
        + Joke::SPACE_VOTES
        + Joke::SPACE_CONTENT;
}


#[error_code]
pub enum JokeToEarnError {
    #[msg("The joke content should be 80 characters max, after that it's not funny")]
    JokeContentMaxCharacters,
}
