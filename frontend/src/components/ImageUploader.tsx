import { useState } from "react";
import {
  Upload,
  Button,
  InputNumber,
  Form,
  message,
  Layout,
  Row,
  Col,
  UploadFile,
  Flex,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";

interface CropParams {
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
}

interface ImageUploadResponse {
  key: string;
  url: string;
}

const API_URL = import.meta.env.VITE_API_URL;
const allowedMimeTypes = ["image/jpeg", "image/png"];

const { Content } = Layout;

const ImageUploader = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null);
  const [cropParams, setCropParams] = useState<CropParams>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>("");

  const handleBeforeUpload = (file: RcFile) => {
    if (!allowedMimeTypes.includes(file.type)) {
      message.error("Unsupported format");
      return false;
    }
    return true;
  };

  const handleUploadChange = ({
    file,
    fileList,
  }: {
    file: UploadFile;
    fileList: UploadFile[];
  }) => {
    if (file.status === "done") {
      const response = file.response;
      setUploadedFileKey(response.key);
      setFileList([fileList[fileList.length - 1]]);
      message.success("Image uploaded successfully!");
    } else if (file.status === "removed") {
      setFileList([]);
      setUploadedFileKey(null);
    } else {
      setFileList([fileList[fileList.length - 1]]);
    }
  };

  const handleCrop = async () => {
    const response = await fetch(`${API_URL}/images/crop`, {
      method: "POST",
      body: JSON.stringify({
        ...cropParams,
        key: uploadedFileKey,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      message.error("Image crop failed");
      return;
    }

    const data = (await response.json()) as ImageUploadResponse;
    setCroppedImageUrl(data.url);
    message.success("Image cropped successfully!");
  };

  return (
    <Layout style={{ minHeight: "100vh", justifyContent: "center" }}>
      <Content>
        <Row justify="center" align="middle">
          <Col>
            <div style={{ padding: 20, marginTop: 40, textAlign: "center" }}>
              <Upload
                maxCount={1}
                fileList={fileList}
                beforeUpload={handleBeforeUpload}
                action={`${API_URL}/images/upload`}
                onChange={handleUploadChange}
                onRemove={() => setCroppedImageUrl("")}
              >
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
              <Form layout="inline" style={{ marginTop: 20 }}>
                <Form.Item label="X">
                  <InputNumber
                    value={cropParams.x}
                    min={0}
                    onChange={(value) =>
                      setCropParams({ ...cropParams, x: value })
                    }
                  />
                </Form.Item>
                <Form.Item label="Y">
                  <InputNumber
                    value={cropParams.y}
                    min={0}
                    onChange={(value) =>
                      setCropParams({ ...cropParams, y: value })
                    }
                  />
                </Form.Item>
                <Form.Item label="Width">
                  <InputNumber
                    value={cropParams.width}
                    min={1}
                    onChange={(value) =>
                      setCropParams({ ...cropParams, width: value })
                    }
                  />
                </Form.Item>
                <Form.Item label="Height">
                  <InputNumber
                    value={cropParams.height}
                    min={1}
                    onChange={(value) =>
                      setCropParams({ ...cropParams, height: value })
                    }
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    onClick={handleCrop}
                    type="primary"
                    disabled={Boolean(croppedImageUrl) || !uploadedFileKey}
                  >
                    Crop Image
                  </Button>
                </Form.Item>
              </Form>
              {croppedImageUrl && (
                <Flex
                  vertical
                  style={{
                    marginTop: 20,
                  }}
                >
                  <h3>Cropped Image:</h3>
                  <img
                    src={croppedImageUrl}
                    alt="Cropped"
                    style={{ maxWidth: "100%" }}
                  />
                </Flex>
              )}
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default ImageUploader;
