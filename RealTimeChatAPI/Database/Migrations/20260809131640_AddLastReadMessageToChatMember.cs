using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealTimeChatAPI.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddLastReadMessageToChatMember : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "LastReadMessageId",
                table: "ChatMembers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChatMembers_LastReadMessageId",
                table: "ChatMembers",
                column: "LastReadMessageId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChatMembers_Messages_LastReadMessageId",
                table: "ChatMembers",
                column: "LastReadMessageId",
                principalTable: "Messages",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMembers_Messages_LastReadMessageId",
                table: "ChatMembers");

            migrationBuilder.DropIndex(
                name: "IX_ChatMembers_LastReadMessageId",
                table: "ChatMembers");

            migrationBuilder.DropColumn(
                name: "LastReadMessageId",
                table: "ChatMembers");
        }
    }
}
