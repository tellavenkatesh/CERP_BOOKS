using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncPendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Created",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "CustomerPoNumber",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "IsNegotiable",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "NegotiationRemarks",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "OriginalEstimateId",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "Estimates");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Created",
                table: "Estimates",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CustomerPoNumber",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsNegotiable",
                table: "Estimates",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "NegotiationRemarks",
                table: "Estimates",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OriginalEstimateId",
                table: "Estimates",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "Estimates",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
