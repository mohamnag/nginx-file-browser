/**
 * Created by mohamnag on 11/02/16.
 */



$(document).ready(function () {

    var filesBaseUrl = "http://192.168.1.64:30080/files";

    var fileListElement = $("#file-list");
    var fileItemElementTemplate = fileListElement.find("li").detach();

    function renderFileElement(directory, fileName, fileType, fileSize, fileDate) {

        var fileItemElement = fileItemElementTemplate.clone();

        fileItemElement.addClass(fileType);
        fileItemElement.find(".file-name").text(fileName);

        if (fileDate) {
            fileItemElement.find(".file-date").text(moment(fileDate).fromNow());
        }

        if (fileType === "directory") {
            if (fileName === "..") {
                // navigate to parent dir
                fileItemElement.find(".file-link").click(function () {
                    navigateTo(directory);
                });

            } else {
                // navigate to sub dir
                fileItemElement.find(".file-link").click(function () {
                    navigateTo(directory + fileName + "/");
                });
            }

        } else if (fileType === "other") {
            // nginx returns symlinks as type other,
            // lets try to follow the links
            fileItemElement.find(".file-link").click(function () {
                navigateTo(directory + fileName + "/");
            });

        } else {
            // just file dl
            fileItemElement.find(".file-link")
                .attr("href", directory + fileName)
                .attr("target", "_blank");
        }

        if (fileSize) {
            fileItemElement.find(".file-size").text(fileSize);
        }

        return fileItemElement;
    }

    function getParentDir(path) {

        if (path.length <= 1) {
            return null;
        }

        var lastSlashPos = path.lastIndexOf("/", path.length - 2);
        var parentDir = lastSlashPos >= 0 ? path.substr(0, lastSlashPos + 1) : null;

        return parentDir;
    }

    function navigateTo(path) {
        console.log("navigateTo", path);

        $.ajax({
            url: filesBaseUrl + path,
            success: function (filesData) {

                filesData.map(function (fileData) {
                    return fileData.mtime = new Date(fileData.mtime);
                });

                filesData.sort(function (fileA, fileB) {
                    return fileB.mtime.getTime() - fileA.mtime.getTime();
                });

                fileListElement.empty();

                var parentDir = getParentDir(path);

                if (parentDir) {
                    fileListElement.append(renderFileElement(
                        parentDir,
                        "..",
                        "directory"
                    ));
                }

                filesData.forEach(function (fileData) {
                    fileListElement.append(renderFileElement(
                        path,
                        fileData.name,
                        fileData.type,
                        fileData.size,
                        fileData.mtime
                    ));
                });

            }
        });
    }

    navigateTo("/");

});