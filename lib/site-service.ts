import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, writeBatch } from "firebase/firestore"
import { db } from "./firebase"
import { calculateExpirationDate } from "./date-utils"

export const addSite = async (siteData) => {
  const sitesCollection = collection(db, "sites")

  const siteWithTimestamps = {
    ...siteData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  return await addDoc(sitesCollection, siteWithTimestamps)
}

export const updateSite = async (siteId, siteData) => {
  const siteRef = doc(db, "sites", siteId)

  const updatedData = {
    ...siteData,
    updatedAt: serverTimestamp(),
  }

  return await updateDoc(siteRef, updatedData)
}

export const deleteSite = async (siteId) => {
  const siteRef = doc(db, "sites", siteId)
  return await deleteDoc(siteRef)
}

export const batchAddSites = async (sitesData, progressCallback = (progress) => {}) => {
  const batch = writeBatch(db)
  const sitesCollection = collection(db, "sites")

  const totalSites = sitesData.length
  let processedSites = 0

  // Processar em lotes menores para evitar limites do Firestore (máx 500 operações por lote)
  const batchSize = 400
  const batches = []

  for (let i = 0; i < totalSites; i += batchSize) {
    const currentBatch = writeBatch(db)
    const currentBatchSites = sitesData.slice(i, i + batchSize)

    for (const site of currentBatchSites) {
      const newSiteRef = doc(collection(db, "sites"))

      // Calcular data de vencimento se não fornecida
      if (!site.expirationDate && site.activationDate) {
        site.expirationDate = calculateExpirationDate(site.activationDate)
      }

      // Garantir valores booleanos
      site.renewed = site.renewed === "true" || site.renewed === true

      // Adicionar timestamps
      const siteWithTimestamps = {
        ...site,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      currentBatch.set(newSiteRef, siteWithTimestamps)
      processedSites++

      // Atualizar progresso
      progressCallback(processedSites / totalSites)
    }

    batches.push(currentBatch)
  }

  // Confirmar todos os lotes
  for (const batch of batches) {
    await batch.commit()
  }

  return processedSites
}
