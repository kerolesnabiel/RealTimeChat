using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealTimeChatAPI.Database.Migrations
{
    /// <inheritdoc />
    public partial class RenameMessaageCipherTextPropertyToText : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CipherText",
                table: "Messages",
                newName: "Text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Text",
                table: "Messages",
                newName: "CipherText");
        }
    }
}
