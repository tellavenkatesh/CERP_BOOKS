using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSalespersonEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Salesperson",
                table: "Estimates");

            migrationBuilder.AddColumn<Guid>(
                name: "SalespersonId",
                table: "Estimates",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Salespeople",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Salespeople", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Estimates_SalespersonId",
                table: "Estimates",
                column: "SalespersonId");

            migrationBuilder.AddForeignKey(
                name: "FK_Estimates_Salespeople_SalespersonId",
                table: "Estimates",
                column: "SalespersonId",
                principalTable: "Salespeople",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Estimates_Salespeople_SalespersonId",
                table: "Estimates");

            migrationBuilder.DropTable(
                name: "Salespeople");

            migrationBuilder.DropIndex(
                name: "IX_Estimates_SalespersonId",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "SalespersonId",
                table: "Estimates");

            migrationBuilder.AddColumn<string>(
                name: "Salesperson",
                table: "Estimates",
                type: "text",
                nullable: true);
        }
    }
}
