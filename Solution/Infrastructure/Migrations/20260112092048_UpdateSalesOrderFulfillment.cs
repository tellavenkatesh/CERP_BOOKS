using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSalesOrderFulfillment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DeliveryStatus",
                table: "SalesOrders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "InvoiceStatus",
                table: "SalesOrders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "QuantityDelivered",
                table: "SalesOrderItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "QuantityInvoiced",
                table: "SalesOrderItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryStatus",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "InvoiceStatus",
                table: "SalesOrders");

            migrationBuilder.DropColumn(
                name: "QuantityDelivered",
                table: "SalesOrderItems");

            migrationBuilder.DropColumn(
                name: "QuantityInvoiced",
                table: "SalesOrderItems");
        }
    }
}
