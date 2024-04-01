use anchor_lang::prelude::*;

declare_id!("7EJv7nx5RmT5Zhbf86XTsaMhfCjp9SteJmQtz3qfTFT4");

#[program]
pub mod token_presale_program {
    use super::*;

    pub fn initialize_token(ctx: Context<InitializeToken>) -> Result<()> {
        let token_mint = &mut ctx.accounts.token_mint;
        token_mint.total_supply = 1_000_000_000;
        Ok(())
    }

    pub fn initialize_presale(ctx: Context<InitializePresale>) -> Result<()> {
        let presale = &mut ctx.accounts.presale;
        presale.token_price = 0.1; // 0.1 SOL per token
        presale.is_active = false;
        presale.max_purchase_amount = 1_000;
        Ok(())
    }

    pub fn start_sale(ctx: Context<StartSale>) -> Result<()> {
        let presale = &mut ctx.accounts.presale;
        presale.is_active = true;
        Ok(())
    }

    pub fn pause_sale(ctx: Context<PauseSale>) -> Result<()> {
        let presale = &mut ctx.accounts.presale;
        presale.is_active = false;
        Ok(())
    }

    pub fn set_token_price(ctx: Context<SetTokenPrice>, price: f64) -> Result<()> {
        let presale = &mut ctx.accounts.presale;
        presale.token_price = price;
        Ok(())
    }

    pub fn buy_tokens(ctx: Context<BuyTokens>, amount: u64) -> Result<()> {
        let presale = &mut ctx.accounts.presale;
        let buyer = &mut ctx.accounts.buyer;
        let token_mint = &mut ctx.accounts.token_mint;

        require!(presale.is_active, ErrorCode::PresalePaused);
        require!(amount <= presale.max_purchase_amount, ErrorCode::ExceedsMaxPurchase);

        let total_cost = amount as f64 * presale.token_price;
        require!(ctx.accounts.payer.lamports() >= total_cost as u64, ErrorCode::InsufficientFunds);

        token_mint.transfer_tokens(buyer, amount)?;
        buyer.balance += amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeToken<'info> {
    #[account(init, payer = payer, space = 8 + 8)]
    pub token_mint: Account<'info, TokenMint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializePresale<'info> {
    #[account(init, payer = payer, space = 8 + 8 + 1 + 8)]
    pub presale: Account<'info, Presale>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StartSale<'info> {
    #[account(mut)]
    pub presale: Account<'info, Presale>,
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct PauseSale<'info> {
    #[account(mut)]
    pub presale: Account<'info, Presale>,
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetTokenPrice<'info> {
    #[account(mut)]
    pub presale: Account<'info, Presale>,
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub presale: Account<'info, Presale>,
    #[account(mut)]
    pub buyer: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_mint: Account<'info, TokenMint>,
    #[account(mut)]
    pub payer: Signer<'info>,
}

#[account]
pub struct TokenMint {
    pub total_supply: u64,
}

impl TokenMint {
    pub fn transfer_tokens(&mut self, receiver: &mut Account<'_, TokenAccount>, amount: u64) -> Result<()> {
        receiver.balance += amount;
        Ok(())
    }
}

#[account]
pub struct TokenAccount {
    pub balance: u64,
}

#[account]
pub struct Presale {
    pub token_price: f64,
    pub is_active: bool,
    pub max_purchase_amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Presale is currently paused.")]
    PresalePaused,
    #[msg("Purchase amount exceeds the maximum allowed.")]
    ExceedsMaxPurchase,
    #[msg("Insufficient funds to complete the purchase.")]
    InsufficientFunds,
}