/* global Utils, InvalidYouTubeVideoURLException, NoVideoFoundException */

/**
 * This component is responsible for finding a video source that works (a mirror)
 * It attempts to do so by making a request to the GenYouTube website and finding their sources for the video.
 *
 * Inputs:
 *      - A YouTube video url
 *
 * Results:
 *      - Hopefully, we find some video links when calling the function findMirrors.
 */

var GenYouTubeMirrorFinder;
(function () {
    "use strict";

    GenYouTubeMirrorFinder = function () {
    };

    GenYouTubeMirrorFinder.prototype.findMirrors = function (youtubeVideoURL, callback) {
        if (Utils.isYoutubeVideoLink(youtubeVideoURL)) {
            var request = new XMLHttpRequest(),
                self = this;

            request.open("GET", youtubeVideoURL.replace("youtube", "genyoutube"), true);

            request.onreadystatechange = function () {
                if (Utils.isXMLHttpRequestDone(request)) {
                    var htmlDoc = Utils.getHTMLDocumentFromText(request.responseText),
                        hdVideoIcon = htmlDoc.getElementsByClassName("glyphicon-hd-video")[0],
                        sdVideoIcon = htmlDoc.getElementsByClassName("glyphicon-sd-video")[0],
                        mirrors = {},
                        linkTag;

                    if (hdVideoIcon) {
                        linkTag = hdVideoIcon.parentNode.parentNode;

                        mirrors['720'] = self.removeTitleParameterFromLink(linkTag.href);
                    }

                    if (sdVideoIcon) {
                        linkTag = sdVideoIcon.parentNode.parentNode;

                        mirrors['360'] = self.removeTitleParameterFromLink(linkTag.href);
                    }

                    if (Object.keys(mirrors).length === 0) {
                        callback(new NoVideoFoundException());
                        return;
                    }

                    callback(mirrors);
                }
            };

            request.send();
        } else {
            throw new InvalidYouTubeVideoURLException();
        }
    };

    // The links provided by the GenYoutube platform usually come with a parameter called title that makes the video
    // get downloaded. This method aims to remove that parameter and return a link without that parameter
    GenYouTubeMirrorFinder.prototype.removeTitleParameterFromLink = function (videoMirror) {
        function replaceRegex(match, p1, p2, offset, string) {
            if ((p1 === "?") || (p1 === p2)) {
                return p1;
            } else {
                return "";
            }
        }

        return videoMirror.replace(/(&|\?)title=.*?(&|$)/, replaceRegex);
    };
}());
