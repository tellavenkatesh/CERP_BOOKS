using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSalesOrderFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Adjustment",
                table: "SalesOrders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "CustomerNotes",
                table: "SalesOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PlaceOfSupply",
                table: "SalesOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Salesperson",
                table: "SalesOrders",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ShippingCharges",
                table: "SalesOrders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "TermsAndConditions",
                table: "SalesOrders",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Adjustment",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "CustomerNotes",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "PlaceOfSupply",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "Salesperson",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "ShippingCharges",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "TermsAndConditions",
                table: "SalesOrders");
        }
    }
}
