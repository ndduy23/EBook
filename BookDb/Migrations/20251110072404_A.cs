using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookDb.Migrations
{
    /// <inheritdoc />
    public partial class A : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_DocumentPages_DocumentPageId",
                table: "Bookmarks");

            migrationBuilder.DropIndex(
                name: "IX_Bookmarks_DocumentPageId",
                table: "Bookmarks");

            migrationBuilder.AddColumn<int>(
                name: "AuthorId",
                table: "Documents",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OwnerId",
                table: "Documents",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "DocumentPageId",
                table: "Bookmarks",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "DocumentId",
                table: "Bookmarks",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PageNumber",
                table: "Bookmarks",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Bookmarks",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Authors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Authors", x => x.Id);
                    table.UniqueConstraint("AK_Authors_Name", x => x.Name);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Documents_Author",
                table: "Documents",
                column: "Author");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_AuthorId",
                table: "Documents",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookmarks_DocumentId_PageNumber",
                table: "Bookmarks",
                columns: new[] { "DocumentId", "PageNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Bookmarks_DocumentPageId",
                table: "Bookmarks",
                column: "DocumentPageId",
                unique: true,
                filter: "[DocumentPageId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookmarks_DocumentPages_DocumentPageId",
                table: "Bookmarks",
                column: "DocumentPageId",
                principalTable: "DocumentPages",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookmarks_Documents_DocumentId",
                table: "Bookmarks",
                column: "DocumentId",
                principalTable: "Documents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Authors_Author",
                table: "Documents",
                column: "Author",
                principalTable: "Authors",
                principalColumn: "Name",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Authors_AuthorId",
                table: "Documents",
                column: "AuthorId",
                principalTable: "Authors",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_DocumentPages_DocumentPageId",
                table: "Bookmarks");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_Documents_DocumentId",
                table: "Bookmarks");

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Authors_Author",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Authors_AuthorId",
                table: "Documents");

            migrationBuilder.DropTable(
                name: "Authors");

            migrationBuilder.DropIndex(
                name: "IX_Documents_Author",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_AuthorId",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Bookmarks_DocumentId_PageNumber",
                table: "Bookmarks");

            migrationBuilder.DropIndex(
                name: "IX_Bookmarks_DocumentPageId",
                table: "Bookmarks");

            migrationBuilder.DropColumn(
                name: "AuthorId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "DocumentId",
                table: "Bookmarks");

            migrationBuilder.DropColumn(
                name: "PageNumber",
                table: "Bookmarks");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Bookmarks");

            migrationBuilder.AlterColumn<int>(
                name: "DocumentPageId",
                table: "Bookmarks",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookmarks_DocumentPageId",
                table: "Bookmarks",
                column: "DocumentPageId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookmarks_DocumentPages_DocumentPageId",
                table: "Bookmarks",
                column: "DocumentPageId",
                principalTable: "DocumentPages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
