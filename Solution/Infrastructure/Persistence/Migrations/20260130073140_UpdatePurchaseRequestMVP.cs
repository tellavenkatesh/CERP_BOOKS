using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePurchaseRequestMVP : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Description",
                table: "PurchaseRequests",
                newName: "Reason");

            migrationBuilder.AlterColumn<DateTime>(
                name: "RequiredDate",
                table: "PurchaseRequests",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<string>(
                name: "ApprovedBy",
                table: "PurchaseRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "PurchaseRequests",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                table: "PurchaseRequests",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "Remarks",
                table: "PurchaseRequests");

            migrationBuilder.RenameColumn(
                name: "Reason",
                table: "PurchaseRequests",
                newName: "Description");

            migrationBuilder.AlterColumn<DateTime>(
                name: "RequiredDate",
                table: "PurchaseRequests",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);
        }
    }
}
