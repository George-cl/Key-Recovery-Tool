import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import Alert from "react-bootstrap/Alert";
import { decodeBase64, Keys } from "casper-js-sdk";
import { saveAs } from "file-saver";
import { useState } from "react";

function App() {

  const [validated, setValidated] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [algorithm, setAlgorithm] = useState("");
  const [pemData, setPemData] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
    } else {
      try {
        tryConvertToPEM();
        setSuccess(true);
      } catch (err) {
        console.error(err);
        setError("" + err);
      }
    }
    setValidated(true);
  };

  const tryConvertToPEM = () => {
    const keyBytes = decodeBase64(secretKey);
    switch (algorithm) {
      case "ED25519": {
        let parsedSecretKey = Keys.Ed25519.parsePrivateKey(keyBytes);
        let parsedPublicKey = Keys.Ed25519.privateToPublicKey(parsedSecretKey);
        let keypair = Keys.Ed25519.parseKeyPair(parsedPublicKey, parsedSecretKey);
        setPemData(keypair.exportPrivateKeyInPem());
        break;
      }
      case "SECP256K1": {
        let parsedSecretKey = Keys.Secp256K1.parsePrivateKey(keyBytes);
        let parsedPublicKey = Keys.Secp256K1.privateToPublicKey(parsedSecretKey);
        let keypair = Keys.Secp256K1.parseKeyPair(parsedPublicKey, parsedSecretKey, "raw");
        setPemData(keypair.exportPrivateKeyInPem());
        break;
      }
      default: throw new Error("Invalid algorithm");
    }
  }

  const downloadPemFile = () => {
    try {
      const blob = new Blob([pemData], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, "recovered_secret_key.pem");
    } catch (err) {
      console.error(err);
      setError("" + err);
    }
  }

  return (
    <div id="App" style={{ margin: "3rem" }}>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
        crossOrigin="anonymous"
      />
      {
        error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            <Alert.Heading>Oops! Something went wrong</Alert.Heading>
            <p>
              An error occurred:
              <br />
              &nbsp;&nbsp;<code>{error}</code>
              <br />
              Please try again. If you get stuck you can get in touch with our support team on <a href="https://discord.gg/jQU7d75wzs">Discord</a>.
            </p>
          </Alert>
        )
      }
      {
        success && (
          <Alert variant="success">
            <Alert.Heading>Success!</Alert.Heading>
            <p>Your key was successfully parsed and converted to a PEM file. Please download the file and check that it has worked as you expected. If you have any issues please get in touch with our support team on <a href="https://discord.gg/jQU7d75wzs">Discord</a>.</p>
            <hr />
            <div className="d-flex justify-content-end">
              {
                pemData && (
                  <Button variant="success" onClick={downloadPemFile}>
                    Download PEM File
                  </Button>
                )
              }
            </div>
          </Alert>
        )
      }
      <Stack gap={2} className="col md-5 mx-auto">
        <h2>Key Recovery Tool - Base64 to PEM</h2>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formEnterKey">
            <Form.Label>Enter the raw (<code>base64</code>) secret key</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Paste key here"
              onChange={e => {
                setSecretKey(e.currentTarget.value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              Please provide a secret key.
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              The recovery process takes place on your local machine - feel free to disconnect from the internet for added security.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formAlgorithmSelect">
            <Form.Label>Select algorithm</Form.Label>
            {["ED25519", "SECP256K1"].map(algorithm => {
              return <Form.Check
                required
                name="algorithm"
                type="radio"
                label={algorithm}
                value={algorithm}
                onChange={e => {
                  setAlgorithm(e.currentTarget.value)
                }}
                key={algorithm}
              />
            })}
            <Form.Text className="text-muted">
              If your public key starts with "01" then select "ED25519", if it starts with "02" then select "SECP256K1".
            </Form.Text>
          </Form.Group>
          <Button variant="primary" type="submit">
            Recover
          </Button>
        </Form>
      </Stack>
    </div>
  )
}

export default App
