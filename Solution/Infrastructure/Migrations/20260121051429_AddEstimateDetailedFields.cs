using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEstimateDetailedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Adjustment",
                table: "Estimates",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "PlaceOfSupply",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProjectName",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Salesperson",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ShippingCharges",
                table: "Estimates",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Adjustment",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "PlaceOfSupply",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "ProjectName",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "Salesperson",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "ShippingCharges",
                table: "Estimates");
        }
    }
}
