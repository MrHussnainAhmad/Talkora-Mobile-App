import { StyleSheet, Dimensions } from "react-native";
import COLORS from "../../constants/COLORS";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
    padding: 20,
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
    backgroundColor: "#f8f8f8",
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
  button: {
    backgroundColor: "#7944f5",
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
