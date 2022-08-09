use anchor_lang::prelude::*;

declare_id!("HZy4kyk53Zsrzgv84fuRmuXFNar9VAyJmqwVZtK1iEVy");

#[program]
pub mod joketoearn {
    use super::*;

    pub fn create_joke(ctx: Context<CreateJokeCtx>, joke_content: String) -> Result<()> {
        let joke: &mut Account<Joke> = &mut ctx.accounts.joke_account;
        joke.author = *ctx.accounts.authority.key;
        joke.created_at = Clock::get().unwrap().unix_timestamp;

        if joke_content.chars().count() > LEN_CONTENT {
            return Err(error!(JokeToEarnError::JokeContentMaxCharacters));
        }
        joke.content = joke_content;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateJokeCtx<'info> {
    // properly set the space later
    #[account(init, payer = authority, space = Joke::LEN)]
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

// 3. Add a constant on the Tweet account that provides its total size.
const LEN_DISCRIMINATOR: usize = 8;
const LEN_AUTHOR: usize = 32;
const LEN_CREATED_AT: usize = 8;
// Max of 80 characters but a borsh string is [len+vec] https://borsh.io/
const LEN_CONTENT: usize = 84;

impl Joke {
    const LEN: usize = LEN_DISCRIMINATOR
        + LEN_AUTHOR
        + LEN_CREATED_AT
        + LEN_CONTENT;
}


#[error_code]
pub enum JokeToEarnError {
    #[msg("The joke content should be 80 characters max, after that it's not funny")]
    JokeContentMaxCharacters,
}
