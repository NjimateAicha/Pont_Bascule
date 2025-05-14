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
            var oVehiculeModel = new JSONModel({
                Idvehicule: "",
                Matricule: "",
                Marque: "",
                Capacite: "",
                Qunit: "",
                Idtransporteur: ""
            });
            this.getView().setModel(oVehiculeModel, "newvehicule");
        
            this._oODataModel = this.getOwnerComponent().getModel();
        
            var oSmartTable = this.byId("smartTablevehicule");
            if (oSmartTable) {
                oSmartTable.attachInitialise(() => {
                    const oTable = oSmartTable.getTable();
                    if (oTable.setMode) {
                        oTable.setMode("SingleSelectMaster");
                    }
                });
            }
        
            // ✅ Définir `that` ici
            var that = this;
        
            // Charger les transporteurs dans un modèle JSON
            this._oODataModel.read("/zcds_transporter", {
                success: function (oData) {
                    var oTransporteurModel = new JSONModel(oData);
                    that.getView().setModel(oTransporteurModel, "transporteur");
                },
                error: function () {
                    MessageBox.error("Erreur lors du chargement des transporteurs.");
                }
            });
        },
        

        _setupSmartTable: function () {
            var oSmartTable = this.getView().byId("smartTablevehicule");
            if (oSmartTable) {
                oSmartTable.setInitiallyVisibleFields("Idvehicule,Matricule,Marque,Capacite,Qunit,Idtransporteur");
            }
        },

       

        onCancelvehiculeDialog: function () {
            this.getView().byId("addvehiculeDialog").close();
        },

        onSavevehicule: function () {
            var oModel = this._oODataModel;
            var oData = Object.assign({}, this.getView().getModel("newvehicule").getData());



              
            var sMATRICULE = oData.Matricule;
            var oMATRICULERegex = /^\d{2}-(?:[a-zA-Zء-ي])-\d{5}$/; // 2 chiffres - caractère - 5 chiffres
        
            if (!oMATRICULERegex.test(sMATRICULE)) {
                MessageBox.error("Le MATRICULE n'est pas valide.");
                return; // Stop save process
            }
        
            if (this._bEditMode && this._sEditPath) {
                oModel.update(this._sEditPath, oData, {
                    success: () => {
                        MessageToast.show("Véhicule modifié avec succès !");
                        oModel.refresh();
                    },
                    error: () => {
                        MessageBox.error("Erreur lors de la modification du véhicule.");
                    }
                });
            } else {
                oModel.create("/ZCDS_vehicule", oData, {
                    success: () => {
                        MessageToast.show("Véhicule ajouté avec succès !");
                        oModel.refresh();
                    },
                    error: () => {
                        MessageBox.error("Erreur lors de l'ajout du véhicule.");
                    }
                });
            }
        
            this.getView().byId("addvehiculeDialog").close();
            this._bEditMode = false;
            this._sEditPath = null;
        
            this.getView().getModel("newvehicule").setData({
                Idvehicule: "",
                Matricule: "",
                Marque: "",
                Capacite: "",
                Qunit: "",
                Idtransporteur: ""
            });
        },
        onCancelvehiculeDialog: function () {
            this.getView().byId("addvehiculeDialog").close();
            this._bEditMode = false;
            this._sEditPath = null;
        },
        onAddvehiculePress: function () {
            var that = this;
        
            // Lire les véhicules existants
            this._oODataModel.read("/ZCDS_vehicule", {
                success: function (oData) {
                    var aVehicules = oData.results || [];
                    var maxId = 0;
        
                    aVehicules.forEach(function (veh) {
                        var id = parseInt(veh.Idvehicule, 10); // Assurez-vous que l'ID est traité comme un entier
                        if (!isNaN(id) && id > maxId) {
                            maxId = id;
                        }
                    });
                    // Générer le nouvel ID
                    var nextId = maxId + 1; // Incrémenter de 1
                    var idchar = nextId.toString();

                    // Remplir le modèle avec l'ID généré
                    that.getView().getModel("newvehicule").setData({
                        Idvehicule: idchar,
                        Matricule: "",
                        Marque: "",
                        Capacite: null,
                        Qunit: "",
                        Idtransporteur: ""
                    });
        
                    // Ouvrir le dialog
                    that.getView().byId("addvehiculeDialog").open();
                    that._bEditMode = false; // mode création
                },
                error: function () {
                    MessageBox.error("Erreur lors du chargement des véhicules existants.");
                }
            });
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
        },
        onEditVehiculePress: function () {
            var oSmartTable = this.getView().byId("smartTablevehicule");
            var oTable = oSmartTable.getTable();
            var oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                MessageBox.warning("Veuillez sélectionner un véhicule à modifier.");
                return;
            }
        
            var oContext = oSelectedItem.getBindingContext();
            var oVehiculeData = oContext.getObject();
        
            this.getView().getModel("newvehicule").setData(Object.assign({}, oVehiculeData));
        
            this._bEditMode = true;
            this._sEditPath = oContext.getPath();
        
            this.byId("addvehiculeDialog").open();
        },
        onDeleteVehiculePress: function () {
            var oSmartTable = this.getView().byId("smartTablevehicule");
            var oTable = oSmartTable.getTable();
            var oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                MessageBox.warning("Veuillez sélectionner un véhicule à supprimer.");
                return;
            }
        
            var oContext = oSelectedItem.getBindingContext();
            var sPath = oContext.getPath();
        
            MessageBox.confirm("Voulez-vous vraiment supprimer ce véhicule ?", {
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        this._oODataModel.remove(sPath, {
                            success: () => {
                                MessageToast.show("Véhicule supprimé avec succès.");
                                this._oODataModel.refresh();
                            },
                            error: () => {
                                MessageBox.error("Erreur lors de la suppression.");
                            }
                        });
                    }
                }
            });
        }
        
        

    });
});
