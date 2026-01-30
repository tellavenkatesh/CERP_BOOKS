using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDetailedAddressFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BillingAttention",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BillingFax",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BillingPhone",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BillingStreet2",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShippingAttention",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShippingCity",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShippingCountry",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShippingFax",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShippingPhone",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShippingPincode",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShippingState",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShippingStreet2",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BillingAttention",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "BillingFax",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "BillingPhone",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "BillingStreet2",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "ShippingAttention",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "ShippingCity",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "ShippingCountry",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "ShippingFax",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "ShippingPhone",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "ShippingPincode",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "ShippingState",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "ShippingStreet2",
                table: "Parties");
        }
    }
}
