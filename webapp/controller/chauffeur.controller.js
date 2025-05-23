sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/m/Column",              
    "sap/m/Text" 
], function (Controller, JSONModel, MessageBox, MessageToast, History, Column, Text) {
    "use strict";

    return Controller.extend("projectsd.controller.chauffeur", {

       
        onInit: function () {
            var that = this;
        
            // Modèle pour le formulaire d'ajout de chauffeur
            var oChauffeurModel = new JSONModel({
                Idchauffeur: "",
                Cin: "",
                Nomchauffeur: "",
                Telechauffeur: "",
                Idtransporter: "",
                Idvehicule: ""
            });
            this.getView().setModel(oChauffeurModel, "newchauffeur");




            
                     
        
            // Récupérer le modèle OData
            this._oODataModel = this.getOwnerComponent().getModel();

   // Charger les données de mapping
   this._loadTransporterMap();
   this._loadVehiculeMap();

                var oSmartTable = this.byId("smartTableChauffeur");
                
    
                // Configuration de la SmartTable si nécessaire
                this._setupSmartTable();
                oSmartTable.attachInitialise(() => {
                    const oTable = oSmartTable.getTable();
                    
                    // Si la table est une ResponsiveTable (sap.m.Table), utilise cette méthode
                    if (oTable.setMode) {
                      oTable.setMode("SingleSelectMaster"); // ou "MultiSelect"
                    }
                  //  oTable.attachUpdateFinished(this._onTableUpdateFinished.bind(this));
                  });
            
        // Assurez-vous que les modèles "transporteur" et "vehicule" sont bien définis avant d'afficher la boîte de dialogue
this._oODataModel.read("/zcds_transporter", {
    success: function (oData) {
        var oTransporteurModel = new JSONModel(oData);
        that.getView().setModel(oTransporteurModel, "transporteur");
    },
    error: function () {
        MessageBox.error("Erreur lors du chargement des transporteurs.");
    }
});

this._oODataModel.read("/ZCDS_vehicule", {
    success: function (oData) {
        var oVehiculeModel = new JSONModel(oData);
        that.getView().setModel(oVehiculeModel, "vehicule");
    },
    error: function () {
        MessageBox.error("Erreur lors du chargement des véhicules.");
    }
});


        },


        _formatTransporterName: function (sId) {
            return this._transporterMap[sId] || "";
        },

        _formatVehiculeMatricule: function (sId) {
            return this._vehiculeMap[sId] || "";
        },

        
        _loadVehiculeMap: function () {
            this._vehiculeMap = {};
            this._oODataModel.read("/ZCDS_vehicule", {
                success: function (oData) {
                    oData.results.forEach(function (v) {
                        this._vehiculeMap[v.Idvehicule] = v.Matricule;
                    }.bind(this));
                }.bind(this),
                error: function () {
                    MessageBox.error("Erreur lors du chargement des véhicules.");
                }
            });
        },


        _loadTransporterMap: function () {
            this._transporterMap = {};
            this._oODataModel.read("/zcds_transporter", {
                success: function (oData) {
                    oData.results.forEach(function (t) {
                        this._transporterMap[t.Idtransporteur] = t.Nomtransporteur;
                    }.bind(this));
                }.bind(this),
                error: function () {
                    MessageBox.error("Erreur lors du chargement des transporteurs.");
                }
            });
        },

        // _onTableUpdateFinished: function (oEvent) {
        //     var oTable = oEvent.getSource();
        //     var aItems = oTable.getItems();

        //     if (!aItems.length) return;

        //     if (!this._bExtraColumnsAdded) {
        //         this._bExtraColumnsAdded = true;
        //         oTable.addColumn(new Column({
        //             header: new Text({ text: "Nom transporteur" })
        //         }));
        //         oTable.addColumn(new Column({
        //             header: new Text({ text: "Matricule véhicule" })
        //         }));
        //     }

        //     aItems.forEach(function (oItem) {
        //         if (oItem.getCells().length === oTable.getColumns().length - 2) {
        //             var sIdTransporter = oItem.getBindingContext().getProperty("Idtransporter");
        //             var sIdVehicule = oItem.getBindingContext().getProperty("Idvehicule");

        //             oItem.addCell(new Text({
        //                 text: this._formatTransporterName(sIdTransporter)
        //             }));
        //             oItem.addCell(new Text({
        //                 text: this._formatVehiculeMatricule(sIdVehicule)
        //             }));
        //         }
        //     }.bind(this));
        // },

        _setupSmartTable: function () {
            var oSmartTable = this.getView().byId("smartTableChauffeur");
            if (oSmartTable) {
                oSmartTable.setInitiallyVisibleFields("Idchauffeur,Cin,Nomchauffeur,Telechauffeur,Idtransporter,Idvehicule");
            }
        },

        // onAddChauffeurPress: function () {
        //     // Réinitialise le modèle
        //     this.getView().getModel("newchauffeur").setData({
        //         Idchauffeur: "",
        //         Cin: "",
        //         Nomchauffeur: "",
        //         Telechauffeur: "",
        //         Idtransporter: "",
        //         Idvehicule: ""
        //     });

        //     this.getView().byId("addChauffeurDialog").open();
        // },

        onAddChauffeurPress: function () {
            var that = this;
        
            // Réinitialiser le modèle du chauffeur
            this.getView().getModel("newchauffeur").setData({
                Idchauffeur: "",
                Cin: "",
                Nomchauffeur: "",
                Telechauffeur: "",
                Idtransporter: "",
                Idvehicule: "" // Pas de véhicule, donc on laisse cette valeur vide
            });
        
            // Lire les chauffeurs existants pour générer un nouvel ID de chauffeur
            this._oODataModel.read("/zcds_chauffeur", {
                success: function (oData) {
                    var aChauffeurs = oData.results || [];
                    var maxId = 0;
        
                    // Trouver le plus grand ID de chauffeur existant
                    aChauffeurs.forEach(function (chauffeur) {
                        var id = parseInt(chauffeur.Idchauffeur, 10); // Assurez-vous que l'ID est un entier
                        if (!isNaN(id) && id > maxId) {
                            maxId = id;
                        }
                    });
        
                    // Générer le nouvel ID de chauffeur
                    var nextId = maxId + 1; // Incrémenter de 1
                    var idchar = nextId.toString();
        
                    // Mettre à jour le modèle "newchauffeur" avec l'ID généré
                    that.getView().getModel("newchauffeur").setData({
                        Idchauffeur: idchar,
                        Cin: "",
                        Nomchauffeur: "",
                        Telechauffeur: "",
                        Idtransporter: "",
                        Idvehicule: "" // Pas de véhicule, donc on laisse cette valeur vide
                    });
        
                    // Ouvrir la boîte de dialogue d'ajout de chauffeur
                    that.getView().byId("addChauffeurDialog").open();
                },
                error: function () {
                    MessageBox.error("Erreur lors du chargement des chauffeurs.");
                }
            });
        },
        











        
        onCancelChauffeurDialog: function () {
            this.getView().byId("addChauffeurDialog").close();
        },

        onSaveChauffeur: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oData = Object.assign({}, this.getView().getModel("newchauffeur").getData());
        
            // Vérification des valeurs des ComboBoxes
            console.log("Transporteur sélectionné:", oData.Idtransporter);
            console.log("Véhicule sélectionné:", oData.Idvehicule);

            var sPhone = oData.Telechauffeur;
            var oPhoneRegex = /^06\d{8}$/;  // commence par 06 suivi de 8 chiffres
        
            if (!oPhoneRegex.test(sPhone)) {
                MessageBox.error("Le numéro de téléphone n'est pas valide.");
                return; // Stop save process
            }

            
            var sCIN = oData.Cin;
            var oCINRegex = /^[a-zA-Z]{1}[0-9]+$/;
        
            if (!oCINRegex.test(sCIN)) {
                MessageBox.error("Le CIN n'est pas valide.");
                return; // Stop save process
            }
        
        
            // Vérifier si le transporteur et le véhicule sont remplis
            if (!oData.Idtransporter || oData.Idtransporter.trim() === "") {
                MessageBox.error("Le transporteur est obligatoire.");
                return; // Ne pas poursuivre si le transporteur est vide
            }
        
            if (!oData.Idvehicule || oData.Idvehicule.trim() === "") {
                MessageBox.error("Le véhicule est obligatoire.");
                return; // Ne pas poursuivre si le véhicule est vide
            }
        
            // Si tout est valide, procéder à l'ajout ou la modification
            if (this._bEditMode && this._sEditPath) {
                // Modification d'un chauffeur existant
                oModel.update(this._sEditPath, oData, {
                    success: () => {
                        MessageToast.show("Chauffeur modifié avec succès !");
                        oModel.refresh();
                    },
                    error: () => {
                        MessageBox.error("Erreur lors de la modification.");
                    }
                });
            } else {
                // Ajout d'un nouveau chauffeur
                oModel.create("/zcds_chauffeur", oData, {
                    success: () => {
                        MessageToast.show("Chauffeur ajouté avec succès !");
                        oModel.refresh();
                    },
                    error: () => {
                        MessageBox.error("Erreur lors de l'ajout.");
                    }
                });
            }
        
            // Fermer le dialogue et réinitialiser les champs
            this.byId("addChauffeurDialog").close();
            this._bEditMode = false;
            this._sEditPath = null;
        
            // Réinitialisation du modèle de données après l'enregistrement
            this.getView().getModel("newchauffeur").setData({
                Idchauffeur: "",
                Cin: "",
                Nomchauffeur: "",
                Telechauffeur: "",
                Idtransporter: "",
                Idvehicule: ""
            });
        }
        ,
        

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteView1", {}, true);
            }
        } ,





        onEditChauffeurPress: function () {
            var oSmartTable = this.byId("smartTableChauffeur");
            var oTable = oSmartTable.getTable();
            var oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                MessageBox.warning("Veuillez sélectionner un chauffeur à modifier.");
                return;
            }
        
            var oContext = oSelectedItem.getBindingContext();
            var oChauffeurData = oContext.getObject();
        
            this.getView().getModel("newchauffeur").setData(Object.assign({}, oChauffeurData));
        
            this._bEditMode = true;
            this._sEditPath = oContext.getPath();
        
            this.byId("addChauffeurDialog").open();
        },
        
        onDeleteChauffeurPress: function () {
            var oSmartTable = this.byId("smartTableChauffeur");
            var oTable = oSmartTable.getTable();
            var oSelectedItem = oTable.getSelectedItem();
        
            if (!oSelectedItem) {
                MessageBox.warning("Veuillez sélectionner un chauffeur à supprimer.");
                return;
            }
        
            var oContext = oSelectedItem.getBindingContext();
            var sPath = oContext.getPath();
        
            MessageBox.confirm("Voulez-vous vraiment supprimer ce chauffeur ?", {
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        this.getOwnerComponent().getModel().remove(sPath, {
                            success: () => {
                                MessageToast.show("Chauffeur supprimé avec succès.");
                                this.getOwnerComponent().getModel().refresh();
                            },
                            error: () => {
                                MessageBox.error("Erreur lors de la suppression du chauffeur.");
                            }
                        });
                    }
                }
            });
        }
        

    });
});