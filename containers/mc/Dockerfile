FROM minio/mc:RELEASE.2025-02-21T16-00-46Z

# 実行スクリプトをコンテナにコピー
COPY setup.sh /tmp/setup.sh
RUN chmod +x /tmp/setup.sh

# スクリプトを実行
ENTRYPOINT ["/tmp/setup.sh"] 