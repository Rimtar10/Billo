import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import jsQR from "jsqr";
import { useNavigation } from "@react-navigation/native";

export default function QRCodeReader() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const startCamera = () => {
    setResult(null);
    setError(null);
    setScanning(true);
  };

  const stopCamera = () => {
    setScanning(false);
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setImagePreview(null);
    setScanning(false);
  };

  const handleBarCodeScanned = ({ data }) => {
    setResult(data);
    stopCamera();
  };

  const pickImage = async () => {
    setError(null);
    setResult(null);

    const file = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (file.canceled) return;

    const uri = file.assets[0].uri;
    setImagePreview(uri);

    const response = await fetch(uri);
    const blob = await response.blob();
    const img = await createImageBitmap(blob);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const qr = jsQR(imageData.data, imageData.width, imageData.height);

    if (qr) {
      setResult(qr.data);
    } else {
      setError("No QR code found in this image.");
    }
  };

  if (!permission) return <Text>Checking camera permissions…</Text>;

  if (!permission.granted)
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>Camera access required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Enable Camera</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>QR Code Reader</Text>

      {!scanning && !result && (
        <>
          <TouchableOpacity style={styles.button} onPress={startCamera}>
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
            <Text style={styles.secondaryButtonText}>Upload Image</Text>
          </TouchableOpacity>
        </>
      )}

      {scanning && (
        <View style={styles.cameraWrapper}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={stopCamera}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {imagePreview && !result && (
        <Image source={{ uri: imagePreview }} style={styles.preview} />
      )}

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>QR Code Detected</Text>
          <Text style={styles.resultText}>{result}</Text>

          <TouchableOpacity style={styles.button} onPress={reset}>
            <Text style={styles.buttonText}>Scan Another</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EEF2FF",
  },

  backButton: {
    paddingVertical: 10,
    marginBottom: 10,
    width: 80,
  },
  backButtonText: {
    fontSize: 16,
    color: "#2f40fcff",
    fontWeight: "600",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 10,
    color: "#1E1B4B",
  },

  button: {
    backgroundColor: "#2f40fcff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: "#E0E7FF",
    padding: 16,
    borderRadius: 14,
  },
  secondaryButtonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#1E1B4B",
  },

  cameraWrapper: {
    flex: 1,
    marginTop: 20,
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },

  cancelButton: {
    backgroundColor: "#DC2626",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },

  preview: {
    width: "100%",
    height: 250,
    marginTop: 20,
    borderRadius: 12,
  },

  resultBox: {
    marginTop: 30,
    backgroundColor: "#D1FAE5",
    padding: 20,
    borderRadius: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 10,
  },
  resultText: {
    fontFamily: "monospace",
    color: "#064E3B",
  },

  errorBox: {
    marginTop: 30,
    backgroundColor: "#FEE2E2",
    padding: 14,
    borderRadius: 12,
  },
  errorText: {
    color: "#991B1B",
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
