var sheetTmp = SpreadsheetApp.openById('1jFj4z19cXZaPZcZk8nPTPmeO0zBbja5Bg23eXiZr9Pw').getSheetByName("Specs_tmp");
var sheetSpecs = SpreadsheetApp.openById('1jFj4z19cXZaPZcZk8nPTPmeO0zBbja5Bg23eXiZr9Pw').getSheetByName("Specs");


function openDocument(folder, file) {
  try {
    var doc = DocumentApp.openById(file.getId());
  } catch (error) {
    sheetTmp.appendRow([
      folder.getName(),
      file.getName(),
      file.getId(),
      file.getUrl(),
      "NO ACCESS"
    ]);
    return;
  }
  var range = doc.getBody();
  var tables = range.getTables();
  var table = tables[0];

  if (table) {
    var index = ''
    var title = ''
    var status = ''
    var authors = ''
    var type = ''
    var created = ''
    
    for (var i = 0; i < table.getNumRows(); i++) {
      var value = ''
      var cell = table.getCell(i, 1);

      if (cell.getNumChildren() > 0) {
        const p = cell.getChild(0).asParagraph();
        if (p.getNumChildren() > 0) {
          const c = p.getChild(0);
          if (c.getType() == DocumentApp.ElementType.DATE) {
            value = c.asDate().getDisplayText();
          } else if (c.getType() == DocumentApp.ElementType.TEXT) {
            value = c.asText().getText();
          } else if (c.getType() == DocumentApp.ElementType.PERSON) {
            value = c.asPerson().getName() + " <" + c.asPerson().getEmail() + ">";
          }

          switch(table.getCell(i, 0).getText()) {
            case 'Index':
              index = value;
              break;
            case "Title":
              title = value;
              break;
            case "Status":
              status = value;
              break;
            case "Authors":
              authors = value;
              break;
            case "Type":
              type = value;
              break;
            case "Created":
              created = value;
              break;
            default:
              Logger.log("I don't know this row: " + table.getCell(i, 0).getText());
          }
        }
      }
    };

    comments = Drive.Comments.list(file.getId()).items
    openComments = comments.filter(function(comment) {
      return comment["status"] === "open";
    })

    if(index != "XX001" && title != "Design Doc Template") {
      sheetTmp.appendRow([
        folder.getName(),
        file.getName(),
        file.getId(),
        file.getUrl(),
        index,
        title,
        status,
        authors,
        type,
        file.getDateCreated(),
        file.getLastUpdated(),
        comments.length,
        openComments.length
      ]);
    }
  }
}

function listFolders() {
  var parentFolder = DriveApp.getFolderById("19jxxVn_3n6ZAmFl3DReEVgZjxZnlky4X");
  var childFolders = parentFolder.getFolders();

  sheetTmp.clear();
  sheetTmp.appendRow([
    "Folder Name",
    "File name",
    "File ID",
    "File URL",
    "Index",
    "Title",
    "Status",
    "Authors",
    "Type",
    "Created",
    "Last Upated",
    "Number of comments",
    "Number of Open Comments"
  ]);

  while(childFolders.hasNext()) {
    var child = childFolders.next();
    listFiles(child);
  }

  sheetSpecs.setName("tmp");
  sheetTmp.setName("Specs");
  sheetSpecs.setName("Specs_tmp");
}

function listFiles(folder) {
  var files = folder.getFiles();

  while(files.hasNext()) {
    var file = files.next();
    if(file.getMimeType() === "application/vnd.google-apps.document") {
      openDocument(folder, file);
    }

  }
}