variable "layer_name" {
  description = "The layer name of the application"
  type        = string
  default = "netfoor-layer-website"
}

variable "compatible_runtime" {
  description = "values: nodejs18.x, nodejs20.x, nodejs22.x" 
  type        = string
  default     = "nodejs18.x"
}

variable "filename" {
  description = "The name of the file to be used in the S3 bucket"
  type        = string
  default     = "sharp-layer.zip"
}

variable "tags" {
  description = "A map of tags to assign to the resources"
  type        = map(string)
  default     = {
    Name        = "netdoor-layer-website"
    Environment = "prod"
    Owner       = "fortino.rom@gmail.com"
    Team        = "DevOps"
    Project     = "Website Layer"
  ManagedBy   = "terraform"
  CreatedAt   = "8/5/2025"
}
}