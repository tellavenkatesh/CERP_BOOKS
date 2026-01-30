using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateItemMasterFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Unit",
                table: "Items",
                newName: "ManufacturerCode");

            migrationBuilder.RenameColumn(
                name: "StockOnInit",
                table: "Items",
                newName: "OpeningRate");

            migrationBuilder.RenameColumn(
                name: "HsnCode",
                table: "Items",
                newName: "HsnSacCode");

            migrationBuilder.AddColumn<string>(
                name: "AlternateUom",
                table: "Items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Barcode",
                table: "Items",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BaseUom",
                table: "Items",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "BatchTracking",
                table: "Items",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "BrandId",
                table: "Items",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Created",
                table: "Items",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPercentage",
                table: "Items",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "ExpiryTracking",
                table: "Items",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "InventoryLedgerId",
                table: "Items",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ItemGroupId",
                table: "Items",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModified",
                table: "Items",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "OpeningQuantity",
                table: "Items",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "PurchaseLedgerId",
                table: "Items",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SalesLedgerId",
                table: "Items",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SerialTracking",
                table: "Items",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "TaxInclusive",
                table: "Items",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "UomConversionFactor",
                table: "Items",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AlternateUom",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Barcode",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "BaseUom",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "BatchTracking",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "BrandId",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Created",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "DiscountPercentage",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "ExpiryTracking",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "InventoryLedgerId",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "ItemGroupId",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "LastModified",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "OpeningQuantity",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "PurchaseLedgerId",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "SalesLedgerId",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "SerialTracking",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "TaxInclusive",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "UomConversionFactor",
                table: "Items");

            migrationBuilder.RenameColumn(
                name: "OpeningRate",
                table: "Items",
                newName: "StockOnInit");

            migrationBuilder.RenameColumn(
                name: "ManufacturerCode",
                table: "Items",
                newName: "Unit");

            migrationBuilder.RenameColumn(
                name: "HsnSacCode",
                table: "Items",
                newName: "HsnCode");
        }
    }
}
