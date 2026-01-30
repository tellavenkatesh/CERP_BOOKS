using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompreoBooks.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryChallanToInvoice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DeliveryChallanId",
                table: "Invoices",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_DeliveryChallanId",
                table: "Invoices",
                column: "DeliveryChallanId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_DeliveryChallans_DeliveryChallanId",
                table: "Invoices",
                column: "DeliveryChallanId",
                principalTable: "DeliveryChallans",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_DeliveryChallans_DeliveryChallanId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_DeliveryChallanId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "DeliveryChallanId",
                table: "Invoices");
        }
    }
}
