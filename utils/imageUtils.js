import ImageResizer from "react-native-image-resizer";
import RNFS from "react-native-fs";
import { Alert } from "react-native";

// Constants for image resizing
const MAX_WIDTH = 800; // Maximum width of the resized image
const MAX_HEIGHT = 800; // Maximum height of the resized image
const QUALITY = 80; // Compression quality (1-100, higher means better quality)
const MAX_FILE_SIZE = 25 * 1024 * 1024; // Maximum file size allowed (25MB in bytes)

/**
 * Resizes an image while maintaining aspect ratio.
 *
 * @param {Object} image - The image object containing URI and metadata.
 * @returns {Object|null} - Resized image object or null if an error occurs.
 */
export const resizeImage = async (image) => {
    try {
        console.log("🖼️ Original Image URI:", image.uri);

        // Get the original file size
        const originalFileStat = await RNFS.stat(image.uri);
        console.log("📷 Original Image Size:", originalFileStat.size, "bytes");

        // Resize the image using the specified dimensions and quality
        const resizedImage = await ImageResizer.createResizedImage(
            image.uri, // Source image URI
            MAX_WIDTH, // Desired width
            MAX_HEIGHT, // Desired height
            "JPEG", // Output format (JPEG for better compression)
            QUALITY, // Quality percentage
            0 // Rotation (0 means no rotation)
        );

        // Get the new file size after resizing
        const resizedFileStat = await RNFS.stat(resizedImage.uri);
        console.log("🖼️ Resized Image Size:", resizedFileStat.size, "bytes");

        // Check if the resized image still exceeds the maximum file size
        if (resizedFileStat.size > MAX_FILE_SIZE) {
            Alert.alert("Image Too Large", "Even after resizing, the file exceeds 25MB.");
            return null; // Return null to indicate failure
        }

        // Return the resized image with proper metadata
        return {
            uri: resizedImage.uri, // Resized image URI
            name: image.fileName || "resized_photo.jpg", // Preserve original name if available
            type: image.type || "image/jpeg", // Preserve MIME type if available
        };
    } catch (error) {
        console.error("❌ Image resize error:", error);
        return null; // Return null in case of any error
    }
};

