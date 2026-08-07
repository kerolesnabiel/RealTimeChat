using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealTimeChatAPI.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddChatKeyProperty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ChatKey",
                table: "Chats",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Chats_ChatKey",
                table: "Chats",
                column: "ChatKey",
                unique: true,
                filter: "[ChatKey] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Chats_ChatKey",
                table: "Chats");

            migrationBuilder.DropColumn(
                name: "ChatKey",
                table: "Chats");
        }
    }
}
