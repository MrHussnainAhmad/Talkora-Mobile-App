import { StyleSheet, Dimensions } from "react-native";
import COLORS from "../../constants/COLORS";
import { FONTS } from "../../utils/fonts";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 0,
  },
  appName: {
    fontSize: 24,
    fontFamily: FONTS.LIBERTINUS_MONO,
    color: '#111827',
    letterSpacing: 0,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: "relative",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  // FAB Container and Overlay
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  fabOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 998,
  },
  fabOverlayTouchable: {
    flex: 1,
  },
  fabMain: {
    zIndex: 1001,
  },
  fabSubButton: {
    position: "absolute",
    alignItems: "center",
    zIndex: 1000,
  },
  // FAB Button Styles
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  fabMainButtonStyle: {
    backgroundColor: "#000",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  fabSubButtonStyle: {
    backgroundColor: "#000",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  fabButtonLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },
  fabBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  fabBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80, // Position below header
    paddingRight: 20,
  },
  profileModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 200,
    maxWidth: 250,
    elevation: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowColor: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalHeader: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.POPPINS_SEMIBOLD,
    color: '#333333',
    textAlign: "left",
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  modalOptionLast: {
    borderBottomWidth: 0,
  },
  modalOptionText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: FONTS.POPPINS_REGULAR,
    color: '#333333',
  },
  modalOptionIcon: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Dark Mode Styles
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkHeader: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333333',
  },
  darkAppName: {
    color: '#FFFFFF',
  },
  darkProfileModal: {
    backgroundColor: '#2C2C2C',
    borderColor: '#444444',
  },
  darkModalHeader: {
    backgroundColor: '#2C2C2C',
    borderBottomColor: '#444444',
  },
  darkModalTitle: {
    color: '#FFFFFF',
  },
  darkModalContent: {
    backgroundColor: '#2C2C2C',
  },
  darkModalOption: {
    backgroundColor: '#2C2C2C',
  },
  darkModalOptionText: {
    color: '#FFFFFF',
  },
});

export default styles;
