using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDeliveryChallanSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Adjustment",
                table: "DeliveryChallans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ChallanType",
                table: "DeliveryChallans",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PlaceOfSupply",
                table: "DeliveryChallans",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReferenceNumber",
                table: "DeliveryChallans",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RoundOff",
                table: "DeliveryChallans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SubTotal",
                table: "DeliveryChallans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxAmount",
                table: "DeliveryChallans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                table: "DeliveryChallans",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "DeliveryChallanLines",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "DeliveryChallanLines",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Rate",
                table: "DeliveryChallanLines",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxAmount",
                table: "DeliveryChallanLines",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxRate",
                table: "DeliveryChallanLines",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Adjustment",
                table: "DeliveryChallans");

            migrationBuilder.DropColumn(
                name: "ChallanType",
                table: "DeliveryChallans");

            migrationBuilder.DropColumn(
                name: "PlaceOfSupply",
                table: "DeliveryChallans");

            migrationBuilder.DropColumn(
                name: "ReferenceNumber",
                table: "DeliveryChallans");

            migrationBuilder.DropColumn(
                name: "RoundOff",
                table: "DeliveryChallans");

            migrationBuilder.DropColumn(
                name: "SubTotal",
                table: "DeliveryChallans");

            migrationBuilder.DropColumn(
                name: "TaxAmount",
                table: "DeliveryChallans");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "DeliveryChallans");

            migrationBuilder.DropColumn(
                name: "Amount",
                table: "DeliveryChallanLines");

            migrationBuilder.DropColumn(
                name: "Discount",
                table: "DeliveryChallanLines");

            migrationBuilder.DropColumn(
                name: "Rate",
                table: "DeliveryChallanLines");

            migrationBuilder.DropColumn(
                name: "TaxAmount",
                table: "DeliveryChallanLines");

            migrationBuilder.DropColumn(
                name: "TaxRate",
                table: "DeliveryChallanLines");
        }
    }
}
