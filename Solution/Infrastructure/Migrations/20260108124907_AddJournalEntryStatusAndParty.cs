using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddJournalEntryStatusAndParty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PartyId",
                table: "JournalEntryLines",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "JournalEntries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_PartyId",
                table: "JournalEntryLines",
                column: "PartyId");

            migrationBuilder.AddForeignKey(
                name: "FK_JournalEntryLines_Parties_PartyId",
                table: "JournalEntryLines",
                column: "PartyId",
                principalTable: "Parties",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JournalEntryLines_Parties_PartyId",
                table: "JournalEntryLines");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntryLines_PartyId",
                table: "JournalEntryLines");

            migrationBuilder.DropColumn(
                name: "PartyId",
                table: "JournalEntryLines");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "JournalEntries");
        }
    }
}
