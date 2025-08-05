output "arn_layer" {
  description = "The ARN of the layer"
  value       = aws_lambda_layer_version.website_layer_netfoor.arn
}