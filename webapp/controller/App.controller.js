sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";

  return Controller.extend("projectsd.controller.App", {

    // Gère la sélection d’un élément du menu de 
    onSideNavSelect: function (oEvent) {
      const sKey = oEvent.getParameter("item").getKey();
      const oRouter = this.getOwnerComponent().getRouter();
   
      switch (sKey) {
        case "Dashboard":
         this.getOwnerComponent().getRouter().navTo("Dashboard");
          
          break;
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
            case "Bascule":
              this.getOwnerComponent().getRouter().navTo("Bascule");
              break;
        default:
          console.warn("Clé de navigation inconnue :", sKey);
      }
    },

    
    onToggleSidebar: function () {
      const oSidebar = this.byId("_IDGenVBox"); // C'est ta VBox sidebar
      const bVisible = oSidebar.getVisible();
      oSidebar.setVisible(!bVisible);
    }

  });
});
