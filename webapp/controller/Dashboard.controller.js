sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/odata/v2/ODataModel"
], function (Controller, JSONModel, ODataModel) {
  "use strict";

  return Controller.extend("projectsd.controller.Dashboard", {
    onInit: function () {
      var oDashboardModel = new JSONModel();
      this.getView().setModel(oDashboardModel, "dashboard");

      var oDataModel = this.getOwnerComponent().getModel(); // ODataModel déclaré dans manifest.json

      // Commandes
      oDataModel.read("/ZCDS_commande/$count", {
        success: function (oData) {
          oDashboardModel.setProperty("/totalCommandes", parseInt(oData));
        }
      });

      // Clients
      oDataModel.read("/ZCDS_Clientt/$count", {
        success: function (oData) {
          oDashboardModel.setProperty("/totalClients", parseInt(oData));
        },
        error: function (oError) {
          console.error("Erreur lors du comptage des clients :", oError);
        }
      });
      

      // Articles
      oDataModel.read("/ZCDS_article/$count", {
        success: function (oData) {
          oDashboardModel.setProperty("/totalArticles", parseInt(oData));
        }
      });

      // Quantité totale + Montant total des commandes
      oDataModel.read("/ZCDS_commande", {
        success: function (aData) {
          var totalQuantite = 0;
          var totalMontant = 0;

          aData.results.forEach(function (item) {
            totalQuantite += item.Quantite || 0;
            totalMontant += item.Prixtotal || 0;
          });

          oDashboardModel.setProperty("/quantiteTotale", totalQuantite);
          oDashboardModel.setProperty("/montantTotal", totalMontant);
        }
      });
    }
  });
});
