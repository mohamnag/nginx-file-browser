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

        if (fileType === "parent") {
            // navigate to parent dir
            fileItemElement.find(".file-link").click(function () {
                navigateTo(directory);
            });

        } else if (fileType === "directory") {
            // navigate to sub dir
            fileItemElement.find(".file-link").click(function () {
                navigateTo(directory + fileName + "/");
            });

        } else if (fileType === "other") {
            // nginx returns symlinks as type other,
            // lets try to follow the links
            fileItemElement.find(".file-link").click(function () {
                navigateTo(directory + fileName + "/");
            });

        } else {
            // just file dl
            fileItemElement.find(".file-link")
                .attr("href", filesBaseUrl + directory + fileName)
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

    function renderFileList(filesData, path) {

        var sortBy = $('input[name=sort]:checked').val();
        if (sortBy === "date") {
            console.log("sort by date");

            filesData.sort(function (fileA, fileB) {
                return fileB.mtime.getTime() - fileA.mtime.getTime();
            });

        } else if (sortBy === "name") {
            console.log("sort by name");

            filesData.sort(function (fileA, fileB) {
                return fileA.name.toLowerCase().localeCompare(fileB.name.toLowerCase());
            });
        }

        fileListElement.empty();

        var parentDir = getParentDir(path);

        if (parentDir) {
            fileListElement.append(renderFileElement(
                parentDir,
                "..",
                "parent"
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

    function navigateTo(path) {
        console.log("navigateTo", path);
        isNavigating = true;

        $.ajax({
            url: filesBaseUrl + path,
            success: function (filesData) {

                filesData.map(function (fileData) {
                    fileData.mtime = new Date(fileData.mtime);
                    fileData.size = fileData.size ? fileSize(fileData.size) : null;

                    return fileData;
                });

                renderFileList(filesData, path);

                $('input[name=sort]')
                    .unbind("change")
                    .on("change", function () {
                        renderFileList(filesData, path);
                    });

                if (history.replaceState) {
                    // IE10, Firefox, Chrome, etc.
                    console.log("replaceState", path);
                    history.replaceState(null, path, '#' + path);

                } else {
                    // IE9, IE8, etc
                    console.log("change hash", path);
                    window.location.hash = '#!' + path;
                }

                isNavigating = false;
            }
        });
    }

    function sizeOf(bytes) {
        if (bytes == 0) {
            return "0.00 B";
        }
        var e = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B';
    }

    function fileSize(bytes) {
        var exp = Math.log(bytes) / Math.log(1024) | 0;
        var value = bytes / Math.pow(1024, exp);

        if (exp == 0) {
            return value.toFixed(0) + ' bytes';

        } else {
            var result = value.toFixed(2);
            return result + ' ' + 'KMGTPEZY'[exp - 1] + 'B';
        }

    }

    var isNavigating = false;

    function navigateToUrlLocation() {
        var requestedPath = window.location.hash;
        var startPath = requestedPath ? requestedPath.substr(1) : "/";
        navigateTo(startPath);
    }

    if (history.replaceState) {
        window.onpopstate = function () {
            if (!isNavigating) {
                navigateToUrlLocation();
            }
        };
    }

    navigateToUrlLocation();
});