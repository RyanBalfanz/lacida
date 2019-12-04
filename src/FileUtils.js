import FileSaver from 'file-saver';

const FileUtils = {
      saveAs(text, filename, type="text/plain;charset=utf-8") {
          const blob = new Blob([text], {type: type});
          FileSaver.saveAs(blob, filename);
      }
};

export default FileUtils;