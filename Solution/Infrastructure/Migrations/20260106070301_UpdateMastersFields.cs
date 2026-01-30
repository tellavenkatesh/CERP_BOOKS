using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMastersFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentTermsDays",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Parties");

            migrationBuilder.RenameColumn(
                name: "TaxId",
                table: "Parties",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "Parties",
                newName: "Mobile");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "Parties",
                newName: "GstIn");

            migrationBuilder.RenameColumn(
                name: "ContactPerson",
                table: "Parties",
                newName: "DisplayName");

            migrationBuilder.AddColumn<string>(
                name: "BankAccountNumber",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BankIfscCode",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "PaymentTermId",
                table: "Parties",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TdsCategoryId",
                table: "Parties",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TaxCodeId",
                table: "Items",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BankAccountNumber",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "BankIfscCode",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "BankName",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "PaymentTermId",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "TdsCategoryId",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "TaxCodeId",
                table: "Items");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "Parties",
                newName: "TaxId");

            migrationBuilder.RenameColumn(
                name: "Mobile",
                table: "Parties",
                newName: "Phone");

            migrationBuilder.RenameColumn(
                name: "GstIn",
                table: "Parties",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "DisplayName",
                table: "Parties",
                newName: "ContactPerson");

            migrationBuilder.AddColumn<int>(
                name: "PaymentTermsDays",
                table: "Parties",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Parties",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
