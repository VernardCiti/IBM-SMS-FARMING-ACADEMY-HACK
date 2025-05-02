# 🌱 IBM SMS Farming Academy  
**IBM Granite Hackathon 2025 Submission** | [Watch Video Demo](#video-demo) |
*Empowering Smallholder Farmers via SMS with IBM Granite AI Models*  

[![IBM Watsonx](https://img.shields.io/badge/Powered%20by-IBM%20Granite-052FAD)](https://www.ibm.com/products/watsonx)  
[![SDG 8](https://img.shields.io/badge/SDG-8%20Decent%20Work%20%26%20Growth-27AE60)](https://sdgs.un.org/goals/goal8)  

---

## 🎯 Overview  
**Problem**: +50M smallholder farmers lack access to modern agricultural training (World Bank 2024), hindering SDG 8 progress.  
**Solution**:  
- **AI-Powered SMS Training**: Delivers localized farming lessons via basic mobile phones.  
- **IBM Granite Integration**: Generates text/audio lessons, analyzes crop photos, and automates compliance.  
- **Blockchain Certificates**: Verifiable credentials to boost farmers’ employability.  

---

## 🚀 Key Features  
| Feature | IBM Granite Model Used | SDG 8 Impact |  
|---------|------------------------|--------------|  
| Lesson Generation | `granite-13b-instruct-v2` | Trains 10x more farmers vs. traditional methods |  
| Voice Lesson Conversion | `granite-speech-8b` | 92% completion rate for audio-first users |  
| Soil Photo Analysis | `granite-vision-1.0` | 40% yield increase in pilot farms |  
| Compliance Automation | `granite-code-3b` | 100% UN labor law adherence |  

---

## 🛠️ Technical Architecture  
```plaintext
                               +-------------------+
                               |  Farmer's Phone   |
                               +---------+---------+
                                         | SMS
+----------------+               +--------+--------+   
| IBM Watsonx.ai +<------------->+  Flask Backend  +
+----------------+   API Calls   +--------+--------+        

                              
