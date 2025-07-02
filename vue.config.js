module.exports = {
  devServer: {
    host: '0.0.0.0',  // 关键点，允许外部访问
    port: 8080,        // 或你希望的端口
    disableHostCheck: true  // 有时候也需要关掉 host 检查（旧版本）
  }
}
