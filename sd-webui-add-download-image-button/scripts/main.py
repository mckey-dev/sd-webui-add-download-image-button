from modules import scripts


class Script(scripts.Script):
    def title(self):
        return "AddDownloadImageButton"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        return []
