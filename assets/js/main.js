/**
 * Created by wolf.scholle on 01.12.2015.
 */
(function(){
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            initialize();

            resize();
        }
    };



    function resize (){

        var height = window.innerHeight;
        var mainSection = document.getElementById('mainSection');
        mainSection.style.height = (height - 104) + 'px';
    }

    var pdfUpload;
    var renderNew = true;
    var pdfViewer;

    function initialize() {

        window.onresize = resize;

        var openPdfBtn = document.getElementById('openPdfBtn');
        var addPdfBtn = document.getElementById('addPdfBtn');
        var saveAsBtn = document.getElementById('saveAsBtn');
        var clearBtn = document.getElementById('clearBtn');

        pdfUpload = document.getElementById('pdfUpload');
        pdfViewer = document.getElementById('pdfViewer');

        openPdfBtn.onclick = function(){

            renderNew = true;
            pdfUpload.click();
        };

        addPdfBtn.onclick = function() {
            renderNew = false;
            pdfUpload.click();
        };

        pdfUpload.onchange = onFileChange;

        saveAsBtn.onclick = saveAsPdf;

        clearBtn.onclick = function(){
            pdfViewer.innerHTML = '';
        }
    }

    function onFileChange() {

        var file = pdfUpload.files[0];
        pdfUpload.value = '';   //reset selection of upload
        var fr = new FileReader();

        fr.onload = function(){
            var res = fr.result;

            if(file.type == 'application/pdf') {

                var data = new Blob([res] , {type: 'application/pdf'});
                var url = URL.createObjectURL(data);

                PDFJS.workerSrc = 'bower_components/pdfjs-bower/dist/pdf.worker.js';

                PDFJS.getDocument(url).then(function getPdfHelloWorld(pdf) {

                    var pdfViewer = document.getElementById('pdfViewer');

                    if(renderNew == true){
                        pdfViewer.innerHTML = '';
                    }

                    for(var i = 1; i <= pdf.pdfInfo.numPages; i++) {
                        pdf.getPage(i).then(function getPageHelloWorld(page) {
                            var scale = 1;
                            var viewport = page.getViewport(scale);

                            //
                            // Prepare canvas using PDF page dimensions
                            //
                            var canvas = document.createElement('canvas');
                            canvas.draggable = true;
                            canvas.ondragstart = handleDragStart;
                            canvas.ondragover = preventDefaultDragOver;
                            canvas.ondrop = handleDrop;
                            canvas.oncontextmenu = openCanvasContextMenu;
                            var context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;

                            //
                            // Render PDF page into canvas context
                            //
                            var renderContext = {
                                canvasContext: context,
                                viewport: viewport
                            };
                            page.render(renderContext);
                            pdfViewer.appendChild(canvas);
                        });
                    }
                });
            } else {
                alert('The file is not a PDF');
                console.log('no pdf!');
            }
        };
        fr.readAsText(file);
    }

    function saveAsPdf(){

        if(pdfViewer.innerHTML != '') {
            var firstPage = true;
            var doc = new jsPDF('p', 'mm');
            NodeList.prototype.forEach = Array.prototype.forEach;
            pdfViewer.childNodes.forEach(function (canvas) {
                var imgData = canvas.toDataURL(
                    'image/png');
                if (!firstPage) {
                    doc.addPage();
                } else {
                    firstPage = false;
                }
                doc.addImage(imgData, 'PNG', 0, 0);
            });

            doc.save('sample-file.pdf');
        }
    }


    //################# drag and drop handles #######################

    var dragSrcEl = null;

    var $dataImg;

    function handleDragStart(e) {
        // Target (this) element is the source node.
        dragSrcEl = this;

        e.dataTransfer.effectAllowed = 'move';
        var ctx = this.getContext('2d');
        $dataImg = ctx.getImageData(0, 0, this.width, this.height);
        e.dataTransfer.setData('ctx', ctx.getImageData(0, 0, this.width, this.height));
    }
    function handleDrop(e) {
        // this/e.target is current target element.

        if (e.stopPropagation) {
            e.stopPropagation(); // Stops some browsers from redirecting.
        }

        // Don't do anything if dropping the same column we're dragging.
        if (dragSrcEl != this) {
            // Set the source column's HTML to the HTML of the columnwe dropped on.

            var ctx = this.getContext('2d');
            var imgData = ctx.getImageData(0, 0, this.width, this.height);

            dragSrcEl.getContext('2d').putImageData(imgData, 0, 0);

            this.getContext('2d').putImageData($dataImg, 0, 0);
        }

        return false;
    }
    function preventDefaultDragOver(e) {
        e.preventDefault();
        return false;
    }

    //####################### context menu ####################################
    function openCanvasContextMenu(e){
        e.preventDefault();

        //TODO: context menu
        pdfViewer.removeChild(this);    // this on contextmenu "delete"
    }
})();