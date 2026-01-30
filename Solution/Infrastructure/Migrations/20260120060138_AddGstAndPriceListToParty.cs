using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGstAndPriceListToParty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GstTreatment",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "PriceListId",
                table: "Parties",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GstTreatment",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "PriceListId",
                table: "Parties");
        }
    }
}
