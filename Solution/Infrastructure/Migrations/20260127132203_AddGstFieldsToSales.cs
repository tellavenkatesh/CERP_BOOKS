using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGstFieldsToSales : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<decimal>(
                name: "TotalCgstAmount",
                table: "SalesOrders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalIgstAmount",
                table: "SalesOrders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalSgstAmount",
                table: "SalesOrders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CgstAmount",
                table: "SalesOrderItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "IgstAmount",
                table: "SalesOrderItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SgstAmount",
                table: "SalesOrderItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalCgstAmount",
                table: "Invoices",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalIgstAmount",
                table: "Invoices",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalSgstAmount",
                table: "Invoices",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "CgstAmount",
                table: "InvoiceLines",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "IgstAmount",
                table: "InvoiceLines",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SgstAmount",
                table: "InvoiceLines",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Salesperson",
                table: "Estimates",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalCgstAmount",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "TotalIgstAmount",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "TotalSgstAmount",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "CgstAmount",
                table: "SalesOrderItems");

            migrationBuilder.DropColumn(
                name: "IgstAmount",
                table: "SalesOrderItems");

            migrationBuilder.DropColumn(
                name: "SgstAmount",
                table: "SalesOrderItems");

            migrationBuilder.DropColumn(
                name: "TotalCgstAmount",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "TotalIgstAmount",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "TotalSgstAmount",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "CgstAmount",
                table: "InvoiceLines");

            migrationBuilder.DropColumn(
                name: "IgstAmount",
                table: "InvoiceLines");

            migrationBuilder.DropColumn(
                name: "SgstAmount",
                table: "InvoiceLines");

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
                    Email = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
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
    }
}
