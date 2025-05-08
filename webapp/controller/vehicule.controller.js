sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageBox, MessageToast, History) {
    "use strict";

    return Controller.extend("projectsd.controller.vehicule", {

        onInit: function () {
            // Initialisation du modèle JSON pour le formulaire d'ajout
            var oVehiculeModel = new JSONModel({
                Idvehicule: "",
                Matricule: "",
                Marque: "",
                Capacite: null,
                Qunit: "",
                Idtransporteur: ""
            });
            this.getView().setModel(oVehiculeModel, "newvehicule");

            // Récupérer le modèle OData
            this._oODataModel = this.getOwnerComponent().getModel();

            // Configuration de la SmartTable
            this._setupSmartTable();
        },

        _setupSmartTable: function () {
            var oSmartTable = this.getView().byId("smartTablevehicule");
            if (oSmartTable) {
                oSmartTable.setInitiallyVisibleFields("Idvehicule,Matricule,Marque,Capacite,Qunit,Idtransporteur");
            }
        },

        onAddvehiculePress: function () {
            // Réinitialise le modèle pour éviter les anciennes données
            this.getView().getModel("newvehicule").setData({
                Idvehicule: "",
                Matricule: "",
                Marque: "",
                Capacite: null,
                Qunit: "",
                Idtransporteur: ""
            });

            this.getView().byId("addvehiculeDialog").open();
        },

        onCancelvehiculeDialog: function () {
            this.getView().byId("addvehiculeDialog").close();
        },

        onSavevehicule: function () {
            var oModel = this._oODataModel;
            var oNewVehicule = this.getView().getModel("newvehicule").getData();

            // Validation simple
            if (!oNewVehicule.Idvehicule || !oNewVehicule.Matricule) {
                MessageBox.warning("Les champs obligatoires ne sont pas remplis.");
                return;
            }

            // Création dans le backend
            oModel.create("/ZCDS_vehicule", oNewVehicule, {
                success: function () {
                    MessageToast.show("Véhicule ajouté avec succès !");
                },
                error: function (oError) {
                    MessageBox.error("Erreur lors de l'ajout du véhicule.");
                    console.error("Erreur backend :", oError);
                }
            });

            this.getView().byId("addvehiculeDialog").close();
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteView1", {}, true);
            }
        }

    });
});
