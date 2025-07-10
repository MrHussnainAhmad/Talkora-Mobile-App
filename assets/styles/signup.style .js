import { StyleSheet, Dimensions } from "react-native";
import COLORS from "../../constants/COLORS";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#f6f2ff",
    padding: 20,
  },
  title: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  scrollViewStyle: {
    flex: 1,
  },
  topIllustration: {
    alignItems: "center",
    width: "100%",
  },
  illustrationImage: {
    width: width * 0.5,
    height: width * 0.49,
  },
  card: {
    backgroundColor: "#f6f2ff",
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    marginTop: 24,
  },
  formContainer: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "Black",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
  },
  eyeIcon: {
    padding: 8,
  },
  submitButton: {
    backgroundColor: "#422bd5",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  link: {
    color: "#fb012e",
    fontWeight: "600",
  },
});

export default styles;
