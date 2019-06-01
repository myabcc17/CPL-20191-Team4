(function () {
    var takePicture = document.querySelector("#take-picture"),
        showPicture = document.querySelector("#show-picture");
 
    if (takePicture && showPicture) {
        // 이벤트 설정
        takePicture.onchange = function (event) {
            // 찍은 사진이나 파일에 대한 참조 얻기
            var files = event.target.files,
                file;
            if (files && files.length > 0) {
                file = files[0];
                try {
                    // window.URL 객체 얻기
                    var URL = window.URL || window.webkitURL;
 
                    // ObjectURL 생성
                    var imgURL = URL.createObjectURL(file);
 
                    // src에 ObjectURL 지정
                    showPicture.src = imgURL;
 
                    // Revoke ObjectURL
                    URL.revokeObjectURL(imgURL);
                }
                catch (e) {
                    try {
                        // createObjectURL을 지원하지 않는 경우 대안
                        var fileReader = new FileReader();
                        fileReader.onload = function (event) {
                            showPicture.src = event.target.result;
                        };
                        fileReader.readAsDataURL(file);
                    }
                    catch (e) {
                        //
                        var error = document.querySelector("#error");
                        if (error) {
                            error.innerHTML = "Neither createObjectURL or FileReader are supported";
                        }
                    }
                }
            }
        };
    }
})();