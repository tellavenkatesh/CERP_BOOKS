using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RedesignCustomerModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Department",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Designation",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Facebook",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PlaceOfSupply",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "PortalEnabled",
                table: "Parties",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PortalLanguage",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Salutation",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SkypeName",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TaxPreference",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Twitter",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Website",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Department",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Designation",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Facebook",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "PlaceOfSupply",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "PortalEnabled",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "PortalLanguage",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Salutation",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "SkypeName",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "TaxPreference",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Twitter",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "Website",
                table: "Parties");
        }
    }
}
