using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBillEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MatchStatus",
                table: "Bills",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "TdsAmount",
                table: "Bills",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "TdsCategory",
                table: "Bills",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TdsRate",
                table: "Bills",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MatchStatus",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "TdsAmount",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "TdsCategory",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "TdsRate",
                table: "Bills");
        }
    }
}
