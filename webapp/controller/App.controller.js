// sap.ui.define([
//   "sap/ui/core/mvc/Controller"
// ], (BaseController) => {
//   "use strict";

//   return BaseController.extend("projectsd.controller.App", {
//       onInit() {
//       }
//   });
// });

sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("projectsd.controller.App", {

    // Gère la sélection d’un élément du menu de 
    onSideNavSelect: function (oEvent) {
      const sKey = oEvent.getParameter("item").getKey();
      const oRouter = this.getOwnerComponent().getRouter();
      console.log(oRouter);  // Debugging step
      console.log("Selected key:", sKey);  // Debugging step  
      switch (sKey) {
        case "Article":
          
        this.getOwnerComponent().getRouter().navTo("Article");
          
          break;
        case "Client":
          this.getOwnerComponent().getRouter().navTo("Client");
          break;
        case "Commande":
          this.getOwnerComponent().getRouter().navTo("Commande");
          break;
          case "transporter":
          this.getOwnerComponent().getRouter().navTo("transporter");
          break;
          case "vehicule":
          this.getOwnerComponent().getRouter().navTo("vehicule");
          break;
          case "chauffeur":
            this.getOwnerComponent().getRouter().navTo("chauffeur");
            break;
        default:
          console.warn("Clé de navigation inconnue :", sKey);
      }
    },

    // Ouvre ou ferme le menu latéral
    onToggleSidebar: function () {
      const oToolPage = this.byId("toolPage");
      const bExpanded = oToolPage.getSideExpanded();
      oToolPage.setSideExpanded(!bExpanded);
    }

  });
});
