sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, History) {
    "use strict";

    return Controller.extend("projectsd.controller.transportter", {

        onInit: function () {
            // Modèle pour le formulaire de création d’un nouveau transporter

           
            
            var oTransporterModel = new JSONModel({
                Idtransporteur: "",
                Nomtransporteur: "",
                Telephonetansporter: "",
                Adressetansporter: "",
                Type: ""
            });
            this.getView().setModel(oTransporterModel, "newtransporter");

            // Obtenir le modèle OData
            this._oODataModel = this.getOwnerComponent().getModel();

            // Configuration de la SmartTable si nécessaire
            this._setupSmartTable();
        },

        _setupSmartTable: function () {
            var oSmartTable = this.getView().byId("smartTabletrasporter");
            if (oSmartTable) {
                // Optionnel : définir les champs visibles initialement
                oSmartTable.setInitiallyVisibleFields("Idtransporteur,Nomtransporteur,Telephonetansporter,Adressetansporter,Type");
            }
        },



        onAddTransporterPress: function () {
            // Ouvre le dialogue
            this.getView().byId("addTransporterDialog").open();
        },
        
        onCancelTransporterDialog: function () {
            this.getView().byId("addTransporterDialog").close();
        },
        
        onSaveTransporter: function () {
            var oModel = this._oODataModel;
            var oNewTransporter = this.getView().getModel("newtransporter").getData();
            console.log(oNewTransporter);
        
            oModel.create("/zcds_transporter", oNewTransporter, {
                success: function () {
                    sap.m.MessageToast.show("Transporteur ajouté avec succès !");
                },
                error: function () {
                    sap.m.MessageBox.error("Erreur lors de l'ajout du transporteur.");
                }
            });
        
            this.getView().byId("addTransporterDialog").close();
        }
        

     
    });
});
