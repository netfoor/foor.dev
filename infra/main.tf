data "archive_file" "sharp_layer" {
  type        = "zip"
source_dir  = "${path.module}/layer/nodejs"
output_path = "${path.module}/layer/${var.filename}"
excludes = [ 
    "node_modules/.bin/*",
    "**/.bin/*",
 ]
}

resource "aws_lambda_layer_version" "website_layer_netfoor" {
  layer_name          = var.layer_name
  description         = "Layer for netdoor website"
  compatible_runtimes = [var.compatible_runtime]
  filename            = data.archive_file.sharp_layer.output_path
  source_code_hash    = data.archive_file.sharp_layer.output_base64sha256
  license_info        = "MIT"
  depends_on          = [ data.archive_file.sharp_layer ]
}