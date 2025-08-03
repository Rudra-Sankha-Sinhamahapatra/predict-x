ALTER TABLE "options" DROP CONSTRAINT "options_betting_id_betting_board_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "votes" DROP CONSTRAINT "votes_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "wallet" DROP CONSTRAINT "wallet_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_betting_id_betting_board_id_fk" FOREIGN KEY ("betting_id") REFERENCES "public"."betting_board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;